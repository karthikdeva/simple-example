var app = angular.module('plunker', ["integralui"]);

app.controller('MainCtrl', ['$scope', "IntegralUITreeViewService", "$timeout", function($scope, $treeService, $timeout) {
    var userName = "tester";
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

    $scope.showCheckList = function() {
        $scope.checkList = $treeService.getCheckList($scope.deviceHierarchyTreeName, $scope.currentState);
    };

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
          $scope.selectedFilter.filterGroups = JSON.stringify(customFilter,null," ");
          $scope.selectedFilter.filter = JSON.stringify(hierarchyFilters);
        });

    };

    var hierarchy = treeViewData; // defined in api.js

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
      this.filters = {"and": []};
      
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
        console.log("Adding",filterType, "filter", JSON.stringify(filter), "to", JSON.stringify(filterTypeHolder), "and", JSON.stringify(this.filters));
        this.filters.and.push({ "or": filterTypeHolder });
        filterTypeHolder.push(filter);
      };
      
      this.addFilters = function(newFilters, filterType) {
        newFilters.forEach(function(filter) { this.addFilter(filter, filterType); });
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
          console.log(obj,"is array, recursing for each child.");
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
          filter[op] = [ 
                { "var": bindName },
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
