var app = angular.module('plunker', ["integralui", 'selectize']);
app.controller('MainCtrl', ['$scope', "IntegralUITreeViewService", "$timeout", '$document', function($scope, $treeService, $timeout, $document) {
    var userName = "tester";
    var hierarchy = treeViewData; // defined in api.js
    var filterGroupsAPIData = filterGroupsAPI; // defined in api.js
    $scope.filterGroupList = [];

    $scope.filterGroupCollapsedListModel = [];
    $scope.filterGroupCollection = [];
    $scope.filterGroupActiveCollection = [];
    $scope.filterGroupInactiveCollection = [];
    $scope.filterGroupInactiveItemCollections = [];
    $scope.selectizeConfig = {
        create: false,
        valueField: 'id',
        labelField: 'name',
        delimiter: ',',
        searchField: ['name', 'description'],
        placeholder: 'Select',
        render: {
            option: function(item, escape) {
                var label = item.name;
                var caption = item.description;
                return "<div class='filter-item'>" +
                    '<span>' + escape(label) + '</span>' +
                    (caption ? '<span>(' + escape(caption) + ')</span>' : '') +
                    '</div>';
            },
            item: function(item, escape) {

                var label = escape(item.name);
                var caption = escape(item.description);
                var isSelected = $scope.filterGroupInactiveCollection.indexOf(item.id) === -1 ? "checked" : "";
                // var isSelected =item.isSelected?"checked":'';
                return "<div class='filter-item'>" +
                    "<input type='checkbox' class='ui-checkbox' id='" + item.id + "' value='" + item.id + "' " + isSelected + " />" +
                    "<div class='ui-custom-checkbox'></div>" +
                    (label ? '<span class="label-text" title=' + label + ", " + caption + '>' + label + '</span>' : '') +
                    "<i class='fa fa-angle-down icon'></i></div>";

            }

        },
        onInitialize: function(selectize) {
            // receives the selectize object as an argument
        },

        onChange: function(collapsedListArray) {
            if (!collapsedListArray.length) return;

            var cloneActiveList = angular.copy(collapsedListArray);
           var formatedValues = filterGroupsPanel.setFilterGroupsState(cloneActiveList);
            filterGroupsPanel.updateCollapsedView(formatedValues);
            // cloneActiveList.forEach(function(filterGroup) {
            //     var isSelected = inActive.indexOf(filterGroup) !== -1 ? false : true;


            // });
            //updateCollapsedView
            // $scope.filterGroupInactiveCollection.forEach(function(inActivefilterGroup, key) {
            //     if (collapsedListArray.indexOf(inActivefilterGroup) == -1) {
            //         inActive.splice(key, 1);
            //     }
            // });
            // }
            //var filterGroupActiveAndInactiveList = collapsedListArray.concat(inActive);
            // var collapsedList =  angular.copy($scope.filterGroupCollapsedListModel);
            //  filterGroupActiveAndInactiveList.forEach(function(filterGroup,key) {
            //     if ($scope.filterGroupCollapsedListModel.indexOf(filterGroup)  == -1) { 
            //                    collapsedList.splice(key, 1);
            //        }
            //  });

            // filterGroupsPanel.formatFilterGroup(collapsedListArray);
        }
    };

    //$timeout(function() {
    $scope.filterGroupCollapsedListModel[0] = filterGroupsAPI[0].id;
    $scope.filterGroupActiveCollection[0] = filterGroupsAPI[0].id;
    $scope.filterGroupList = filterGroupsAPI;
    $scope.filterGroups = {
        All: filterGroupsAPI
    }
            $scope.filterGroupPanelToggle = function() {

            $scope.filterGroups.isShowPanel = !$scope.filterGroups.isShowPanel;
           // $scope.filterGroups.isShowCreateEditPanel = false;
           // $scope.getSelectedFilterGroupData($scope.filterGroups.defaultSelectedFilterGroupTab);
        };
    var filterGroupsPanel = {
        updateCollapsedView: function(filterGroup) {
            $timeout(function() {
                $scope.filterGroupActiveCollection = filterGroup.active;
                $scope.filterGroupInactiveCollection = filterGroup.inActive;
                console.log('filterGroupActiveCollection', $scope.filterGroupActiveCollection);
                console.log('filterGroupInactiveCollection', $scope.filterGroupInactiveCollection);
            });
        },
        setFilterGroupsState: function(filterGroup, state) {

            var filterGroups = typeof(filterGroup) == "object" ? filterGroup : [filterGroup];
            var inActive = angular.copy($scope.filterGroupInactiveCollection);
            var active = angular.copy($scope.filterGroupActiveCollection);
            console.log(filterGroups);
            var tempFilterGroups = angular.copy(filterGroups);
            filterGroups.forEach(function(filterGroupId, key) {
                var itemIndexOfActiveArray = active.indexOf(filterGroupId);
                var itemIndexOfInactiveArray = inActive.indexOf(filterGroupId);
                  var index = tempFilterGroups.indexOf(filterGroupId);

                if (state) {
                  inActive.splice(itemIndexOfInactiveArray, 1);
                    if (active.indexOf(filterGroupId) !== -1) return;
                    active.push(filterGroupId);
                } else if (state == false) {
                    active.splice(itemIndexOfActiveArray, 1);
                    if (inActive.indexOf(filterGroupId) !== -1) return;
                    inActive.push(filterGroupId);
                } else if (inActive.indexOf(filterGroupId) !== -1) {
                    tempFilterGroups.splice(index, 1);
                 } 
             });
             if(state==undefined){
                   active = tempFilterGroups;
                   if(inActive.length){
                  inActive.forEach(function(inActiveFilterGroupId, key) {
                     if (filterGroups.indexOf(inActiveFilterGroupId) == -1){
                         inActive.splice(key, 1);
                    }
                 });
                }
              }
            var activeUniqueArray = active.filter(function(elem, pos) {
                return active.indexOf(elem) == pos;
            });
            if(inActive.length);
            var inActiveUniqueArray = inActive.filter(function(elem, pos) {
                return inActive.indexOf(elem) == pos;
            });
 
         
            return {
                active: activeUniqueArray,
                inActive: inActiveUniqueArray
            }

        },
        formatFilterGroup: function(filterGroupsArrayList) {
            $scope.filterGroupCollection = [];
            $scope.filterGroupInactiveItemCollections = [];
            var inactiveGroupArray = [];

            filterGroupsArrayList.forEach(function(filterGroupId) {
                $scope.filterGroups.All.forEach(function(filterGroup) {
                    if (filterGroup.id == filterGroupId) {
                        $scope.filterGroupCollection.push(filterGroup);
                    } else if ($scope.filterGroupInactiveCollection.indexOf(filterGroup.id) !== -1 && inactiveGroupArray.indexOf(filterGroup.id)) {
                        $scope.filterGroupInactiveItemCollections.push(filterGroup);
                        inactiveGroupArray.push(filterGroup.id);
                    }
                });
            });
            // console.log($scope.filterGroupCollection)
            // console.log($scope.filterGroupInactiveItemCollections)

            // $scope.filterConfig.filter.sections.filterGroups.activeGroups = $scope.filterGroupCollection;
            // $scope.filterConfig.filter.sections.filterGroups.inactiveGroups = $scope.filterGroupInactiveItemCollections;
            if ($scope.filterGroups.selectedFilterGroup == "selected") {
                return $scope.filterGroupCollection.concat($scope.filterGroupInactiveItemCollections);
            }
            // $scope.filterGroupCollapsedListModel = angular.copy($scope.filterGroupActiveCollection);
        }
    }


    $document.on("click", ".ui-checkbox,.management-panel-section .checkbox", function() {
        FilterGroupUpdateOnChange($(this));
    });

    $scope.applyCollapsedViewFilter = function() {
        var activeFilter = angular.copy($scope.filterGroupActiveCollection);
        filterGroupsPanel.formatFilterGroup(activeFilter);
        $scope.filterGroups.isShowPanel = false;
    };

    var FilterGroupUpdateOnChange = function(checkBoxElement) {
        // console.log("Active", $scope.filterGroupActiveCollection);
        // console.log("In Active", $scope.filterGroupInactiveCollection);
        var value = checkBoxElement.val();

        var isSelected = checkBoxElement.is(':checked');

        //var filterGroupActiveAndInactiveList = active.concat(inActive);
        var formatedValues = filterGroupsPanel.setFilterGroupsState(value, isSelected);
        console.log(formatedValues);
        filterGroupsPanel.updateCollapsedView(formatedValues);

        // var collapsedList =  angular.copy($scope.filterGroupCollapsedListModel);
        //  $scope.filterGroupCollapsedListModel.forEach(function(filterGroup,key) {
        //     if (filterGroupActiveAndInactiveList.indexOf(filterGroup)  == -1) { 
        //                    collapsedList.splice(key, 1);
        //        }
        //  });
        // $scope.filterGroupCollapsedListModel = '';
        //  console.log("collapsedList", collapsedList);
        // $timeout(function() {
        //     if (isSelected) {
        //         $scope.filterGroupCollapsedListModel = filterGroupActiveAndInactiveList;
        //     }
        //     $scope.filterGroupInactiveCollection = angular.copy(inActive);
        //     $scope.filterGroupActiveCollection = angular.copy(active);
        //     //            console.log("Active", $scope.filterGroupActiveCollection);
        //     // console.log("In Active", $scope.filterGroupInactiveCollection);
        //     // console.log("filterGroupCollapsedListModel", $scope.filterGroupCollapsedListModel);
        // });

    };

    $scope.selectedFilter = {
        name: null,
        description: null,
        filter: null
    };

    $scope.farEndHierarchy = "farEndHierarchy";
    $scope.deviceHierarchyTreeName = "deviceHierarchy";
    $scope.checkStates = ['checked', 'indeterminate', 'unchecked'];
    $scope.currentState = 'checked';
    $scope.checkList = [];
    $scope.deviceHierarchyDataFields = {
        id: "path",
        items: "children",
        pid: "parent_path",
        text: "name",
        hasChildren: "has_children"
    };
    $scope.deviceHierarchyItems = [];
    $scope.farEndHierarchyItems = [];
    $scope.checkBoxSettings = {
        autoCheck: true,
        threeState: true
    };

    $scope.filterGroupComponent = {
        tabs: {

        },
        treeView: {
            checkBoxSettings: {
                autoCheck: true,
                threeState: true
            }
        }


    }
    $scope.itemCheckStateChanging = function(e) {
        if (e.value == 'unchecked') {
            e.item.checkState = 'checked';
        }
    };

    $scope.applyForm = function() {
        var customFilter = new FilterGroup(
            userName,
            ($scope.selectedFilter.name || null),
            ($scope.selectedFilter.description || null)
        );

        var hierarchyFilters = [];
        // If we were filtering on the far_end, we'd pass the bindName "far_end_hierarchies"
        customFilter.traverseHierarchy(hierarchyFilters, $scope.deviceHierarchyItems, $scope.deviceHierarchyDataFields, "hierarchies");
        customFilter.addFilter(hierarchyFilters, "hierarchy");

        $timeout(function() {
            $scope.selectedFilter.filterGroups = JSON.stringify(customFilter, null, " ");
            $scope.selectedFilter.filter = JSON.stringify(hierarchyFilters);
        });

    };


    $scope.showTab = function(tab) {
        $scope.filtergroups.activeTab = tab;
    };
    var loadTimer = $timeout(function() {

        $treeService.loadData($scope.deviceHierarchyTreeName, hierarchy, null, $scope.deviceHierarchyDataFields, false);
        $treeService.updateCheckValues($scope.deviceHierarchyTreeName);
        $treeService.collapse($scope.deviceHierarchyTreeName);
        $timeout.cancel(loadTimer);
    }, 0);


    // A class that handles the building of filter group objects
    function FilterGroup(owner, name, description) {
        this.owner = owner;
        this.name = name;
        this.description = description;
        this.type = "Personal";
        this.is_disabled = false;

        // The filters property is the one that will be seen in the resulting JSON
        this.filters = {
            "and": []
        };

        // This private instance variable holds the map of each filter for lookup purposes
        var filtersByType = {};
        var that = this;
        // This private method can see the filtersByType
        function getFilterTypeHolder(filterType) {
            // If we don't yet have an array for this type of filter (i.e. hierarchy), add one.
            // Store a reference to the array in both the filtersByType and the filters objects.
            if (!filtersByType[filterType]) {
                var filterTypeHolder = [];
                filtersByType[filterType] = filterTypeHolder;
            }
            return filtersByType[filterType];
        }

        // Add filter to the instance variable as well as the filters property
        this.addFilter = function(filter, filterType) {
            var filterTypeHolder = getFilterTypeHolder(filterType);
            console.log("Adding", filterType, "filter", JSON.stringify(filter), "to", JSON.stringify(filterTypeHolder), "and", JSON.stringify(this.filters));
            this.filters.and.push({
                "or": filterTypeHolder
            });
            filterTypeHolder.push(filter);
        };

        this.addFilters = function(newFilters, filterType) {
            newFilters.forEach(function(filter) {
                this.addFilter(filter, filterType);
            });
        };

        // Give this function a private name so it can be called recursively
        this.traverseHierarchy = function traverseHierarchy(filters, obj, structure, bindName) {
            if (!obj) {
                console.log(obj, "is not a valid object");
                return filters;
            }
            if (!Array.isArray(filters)) {
                console.log(filters, "is not a valid filters holder");
                return filters;
            }

            if (Array.isArray(obj)) {
                console.log(obj, "is array, recursing for each child.");
                obj.forEach(function(child) {
                    traverseHierarchy(filters, child, structure, bindName);
                });
            } else if (obj.checkState === "checked") {
                var op = "~";
                var path = obj[structure.id];
                if (obj[structure.hasChildren]) {
                    path += ".*";
                } else if (obj.device_id) {
                    op = "==";
                    bindName = "device_id";
                }
                console.log(obj, "is fully checked, adding path: ", path);
                var filter = {};
                filter[op] = [{
                        "var": bindName
                    },
                    path
                ];
                filters.push(filter);
            } else if (obj.checkState === "indeterminate") {
                console.log(obj, "is partially checked, recursing with children");
                traverseHierarchy(filters, obj[structure.items], structure, bindName);
            }
        };
    }

}]);


// If an entire folder is selected, the filter should be:
// { "~": [{ "var": "hierarchies" }, "Geo.AMER.Canada.*"] }
// (Where the node path for the folder simply has a .* appended)

// If a specific endpoint is selected, the filter should be:
// { "~": [{ "var": "hierarchies" }, "Geo.AMER.Canada.Kirkland_KIR.AMER_CANADA_Kirkland_West_0_Auditorium_SD"] }
// (Just the node path with no modifications)

// If there are multiple folders and/or endpoints selected, they just need to be wrapped up in an or statement like this:

// { "or": [
//   { "~": [{ "var": "hierarchies" }, "Geo.AMER.USA.*"] },
//   { "~": [{ "var": "hierarchies" }, "Geo.AMER.Canada.Kirkland_KIR.AMER_CANADA_Kirkland_West_0_Auditorium_SD"] }
// ] }