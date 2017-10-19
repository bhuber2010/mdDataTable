(function(){
    'use strict';

    function ColumnFilterFeature(ColumnSortFeature, PaginatorTypeProvider, $q){

        var service = this;

        /**
         * This is the first entry point when we initialize the feature.
         *
         * The method adds feature-related variable to the passed object.
         * The variables gets stored afterwards in the dataStorage for the header cell
         *
         * @param $scope
         * @param cellDataToStore
         */
        service.appendHeaderCellData = function($scope, cellDataToStore, dataStorage){
            cellDataToStore.columnFilter = {};
            if($scope.columnFilter && $scope.columnFilter.valuesProviderCallback){
                cellDataToStore.columnFilter.isEnabled = true;
                cellDataToStore.columnFilter.filtersApplied = [];

                cellDataToStore.columnFilter.valuesProviderCallback = _.isFunction($scope.columnFilter.valuesProviderCallback) ?
                  $scope.columnFilter.valuesProviderCallback : function(columnIndex) {
                    console.log("columnIndex:", columnIndex);
                    console.log("columnFiltersComparator:", dataStorage.columnFiltersComparator);
                    console.log("rowsToConsider:", cellDataToStore.columnFilter.rowsToConsider);

                    cellDataToStore.columnFilter.groupedRowsByColVal = _.groupBy(cellDataToStore.columnFilter.rowsToConsider, function(row) {
                      return row.data[columnIndex].value
                    })
                    var keys = _.keys(cellDataToStore.columnFilter.groupedRowsByColVal)
                    cellDataToStore.columnFilter.selectableRowValues = keys
                    return $q.resolve(keys)
                  };

                cellDataToStore.columnFilter.valuesTransformerCallback = _.isFunction($scope.columnFilter.valuesTransformerCallback) ?
                  $scope.columnFilter.valuesTransformerCallback : function(value, columnIndex) {
                    return value
                  }

                cellDataToStore.columnFilter.placeholderText = $scope.columnFilter.placeholderText;
                cellDataToStore.columnFilter.type = $scope.columnFilter.filterType || 'chips';
                cellDataToStore.columnFilter.isActive = cellDataToStore.columnFilter.isActive || false
                cellDataToStore.columnFilter.isFilterBoxShown = true;

                cellDataToStore.columnFilter.setColumnFilterShown = function(bool){
                    //first we hide every column filter if any are active
                    _.each(dataStorage.header, function(headerData){
                        if(headerData.columnFilter.isEnabled){
                            headerData.columnFilter.isFilterBoxShown = false;
                        }
                    });
                    //then we activate ours
                    cellDataToStore.columnFilter.isFilterBoxShown = bool ? true : false;
                }
            }else{
                cellDataToStore.columnFilter.isEnabled = false;
            }
        };

        /**
         * Generating the needed functions and variables for the header cell which will
         * handle the actions of the column filter component.
         *
         * @param $scope
         * @param headerData
         * @param paginator
         */
        service.initGeneratedHeaderCellContent = function($scope, headerData, paginator, dataStorage){
            if(!headerData.columnFilter.isEnabled){
                return;
            }

            headerData.columnFilter.isFilterBoxShown = false;

            $scope.columnFilterFeature = {};

            $scope.columnFilterFeature.cancelFilterDialog = function(event){
                if(event){
                    event.stopPropagation();
                }

                headerData.columnFilter.setColumnFilterShown(false);
            };

            $scope.columnFilterFeature.confirmFilterDialog = function(params){
                params.event.stopPropagation();
                console.log("params.selectedItems:", params.selectedItems);
                headerData.columnFilter.setColumnFilterShown(false);
                headerData.columnFilter.filtersApplied = params.selectedItems;
                dataStorage.updateColumnFiltersComparator(headerData.columnIndex, params.selectedItems)

                //applying changes to sort feature
                ColumnSortFeature.setHeaderSort(headerData, params.sortingData, dataStorage);

                if(paginator.paginatorType === PaginatorTypeProvider.AJAX){
                    paginator.getFirstPage();
                }else{
                    console.log("params:", params);
                    console.log("headerData:", headerData);
                    console.log("dataStorage:", dataStorage);
                    ColumnSortFeature.sortWithColumnFilterNoAJAX(headerData, dataStorage)
                    var matchedRows = []
                    headerData.columnFilter.filtersAppliedRows = {}
                    _.each(params.selectedItems, function(item) {
                      if (headerData.columnFilter.groupedRowsByColVal[item]) {
                        matchedRows = _.concat(matchedRows, headerData.columnFilter.groupedRowsByColVal[item])
                        headerData.columnFilter.filtersAppliedRows[item] = headerData.columnFilter.groupedRowsByColVal[item]
                      } else {
                        var matchedValueRows = _.reduce(headerData.columnFilter.groupedRowsByColVal, function(matchesArray,rowSet, key) {
                          return _.includes(key, item) ? matchesArray.concat(rowSet) : matchesArray
                        }, [])
                        matchedRows = _.concat(matchedRows, matchedValueRows)
                      }
                    })
                    headerData.columnFilter.matchedRows = matchedRows
                    console.log("matchedRows:", matchedRows);
                    console.log("otherActiveFilterColumns:", headerData.columnFilter.otherActiveFilterColumns);
                    var allItemsSelected = params.selectedItems.length == _.keys(headerData.columnFilter.groupedRowsByColVal).length
                    if (params.selectedItems.length && !allItemsSelected) {
                      headerData.columnFilter.isActive = true;
                      dataStorage.updateAllRowsOptionList({visible: false})
                      dataStorage.updateRowsOptionList(matchedRows, {visible: true})
                    } else if (headerData.columnFilter.otherActiveFilterColumns.length && (!params.selectedItems.length || allItemsSelected)) {
                      console.log("OTHER ACTIVE FILTERS");
                      headerData.columnFilter.isActive = allItemsSelected
                      dataStorage.updateRowsOptionList(headerData.columnFilter.rowsToConsider, {visible: true})
                    } else {
                      headerData.columnFilter.isActive = false;
                      dataStorage.updateAllRowsOptionList({visible: true})
                    }
                }
            }
        };

        /**
         * Click handler for the feature when header cell gets clicked
         * @param $scope
         * @param headerRowData
         */
        service.generatedHeaderCellClickHandler = function($scope, headerRowData, element, attrs){
            if(!headerRowData.columnFilter.isEnabled) {
                return;
            }

            headerRowData.columnFilter.otherActiveFilterColumns = []
            _.each($scope.dataStorage.header, function(colHeader, i) {
              if (colHeader.columnFilter.isActive && (colHeader.columnIndex != attrs.index)) {
                headerRowData.columnFilter.otherActiveFilterColumns.push(i)
              }
            })
            console.log("otherActiveFilterColumns", headerRowData.columnFilter.otherActiveFilterColumns);

            $scope.dataStorage.header[attrs.index].columnFilter.rowsToConsider =
              headerRowData.columnFilter.otherActiveFilterColumns.length ?
              _.filter($scope.dataStorage.storage, function(row) {
                var result = !_.some($scope.dataStorage.columnFiltersComparator, function(selectedValuesArray, columnIndexOfFilter) {
                  if (selectedValuesArray.length && (attrs.index != columnIndexOfFilter)) {
                    var removeRow = !_.includes(selectedValuesArray, row.data[columnIndexOfFilter].value)
                    if (removeRow) {
                      removeRow = !_.some(selectedValuesArray, function(selectedValue) {
                        return _.includes(row.data[columnIndexOfFilter].value, selectedValue)
                      })
                    }
                    return removeRow
                  } else {
                    return false
                  }
                })
                return result
              }) : $scope.dataStorage.storage

            console.log("rowsToConsider:", $scope.dataStorage.header[attrs.index].columnFilter.rowsToConsider);

            headerRowData.columnFilter.setColumnFilterShown(!headerRowData.columnFilter.isFilterBoxShown);
        };

        /**
         * Returns with an array of currently applied filters on the columns.
         * @param dataStorage
         * @param callbackArguments
         */
        service.appendAppliedFiltersToCallbackArgument = function(dataStorage, callbackArguments){
            var columnFilters = [];
            var isEnabled = false;

            _.each(dataStorage.header, function(headerData){
                var filters = headerData.columnFilter.filtersApplied || [];

                if(headerData.columnFilter.isEnabled){
                    isEnabled = true;
                }

                columnFilters.push(filters);
            });

            if(isEnabled){
                callbackArguments.options.columnFilter = columnFilters;
            }
        };

        service.resetFiltersForColumn = function(dataStorage, index){
            if(dataStorage.header[index].columnFilter
                && dataStorage.header[index].columnFilter.isEnabled
                && dataStorage.header[index].columnFilter.filtersApplied.length){

                  dataStorage.header[index].columnFilter.isActive = false;
                  dataStorage.header[index].columnFilter.filtersApplied = [];
                  dataStorage.header[index].columnFilter.filtersAppliedRows = {}
                  dataStorage.header[index].columnFilter.matchedRows = []
                  return true;
            }

            return false;
        };

        /**
         * Set the position of the column filter panel. It's required to attach it to the outer container
         * of the component because otherwise some parts of the panel can became partially or fully hidden
         * (e.g.: when table has only one row to show)
         */
        service.positionColumnFilterBox = function(element){
            var elementPosition = element.closest('th').offset();

            var targetMetrics = {
                top: elementPosition.top + 60,
                left: elementPosition.left
            };

            element.css('position', 'absolute');
            element.detach().appendTo('body');

            element.css({
                top: targetMetrics.top + 'px',
                left: targetMetrics.left + 'px',
                position:'absolute'
            });
        }
    }

    angular
        .module('mdDataTable')
        .service('ColumnFilterFeature', ColumnFilterFeature);
}());
