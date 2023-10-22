
var app = angular.module("books_webstore", []);

app.controller("MainController", [
  "$scope",
  "$http",
  "$window",
  function async($scope, $http, $window) {
    $scope.activeButton = "relevance";
    const uri = "https://www.googleapis.com/books/v1/volumes";
    $scope.myVolumesBar = false;
    $scope.showFiltersOptions = false;
    $scope.showPrintTypeOptions = false;
    $scope.queryOptionsTools = false;

    $scope.favorizte_books = [];
    $scope.userData = {};
    $scope.userIsAuthed = false;

    $scope.pagination = {};
    $scope.maxResult = 10;
    $scope.currentPage = 0;
    $scope.totalItems = 0;
    $scope.dataList = [];
    $scope.dataFilter = {};

    var search = "";
    $scope.dataFilter.filters = "all";
    $scope.dataFilter.volumes = "all";
    $scope.dataFilter.print_type = "all";

    let pagesString = "";
    let orderString = "";
    let dataFilterParsed = "?q=all";

    $http
      .get(uri + "?q=all")
      .then(function (response) {
        $scope.dataList = response.data.items;
        $scope.totalItems = response.data.totalItems;
        $scope.maxPage = $scope.calculateMaxPage(
          response.data.totalItems,
          $scope.maxResult
        );
      })
      .catch(function (error) {
        console.error("Error fetching data: ", error);
      });

    $scope.setAsFavoriteBook =  async function (item) {
      await $scope.generateUserId();
      item.isFavorite = true;
      const url = `https://www.googleapis.com/books/v1/mylibrary/bookshelves/shelf/addVolume?volumeId=${item.id}:keyes&key=AIzaSyBt5IOeyTBlBHNvFAjlhBl3FaDROAQtP8E`;
      $http
        .post(url, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "text/json",
          },
        })
        .then(function (response) {
          console.log("HTTP Response:", response.data);
        })
        .catch(function (error) {
          console.error("HTTP Request Error:", error);
        });
    };
    $scope.login = function () {
      $scope.error = "";
      var username = capitalizeFirstLetter($scope.userData.username);
      if (!username) {
        $scope.error = "Please fill the Username input.";
      } else {
        $scope.userData.username = username;
        $scope.userIsAuthed = true;
      }
    };
    $scope.search = function (page = 0, order = "") {
      console.log(page, order);
      if (page === 0) {
        search = $scope.dataFilter.search_q ?? "all";
        dataFilterParsed = "?q=" + search;
        if ($scope.dataFilter.volumes && $scope.dataFilter.volumes !== "all") {
          dataFilterParsed += `+${$scope.dataFilter.volumes}`;
        }
        if ($scope.dataFilter.filters && $scope.dataFilter.filters !== "all") {
          dataFilterParsed += `&filter=${$scope.dataFilter.filters}`;
        }
        if (
          $scope.dataFilter.print_type &&
          $scope.dataFilter.print_type !== "all"
        ) {
          dataFilterParsed += `&printType=${$scope.dataFilter.print_type}`;
        }
      } else if (page !== null) {
        let pagingUpdated = false;
        if (page > 0 && !(page > 3)) {
          $scope.currentPage++;
          pagingUpdated = true;
        } else if (page < 0) {
          pagingUpdated = true;
          if ($scope.currentPage > 0) $scope.currentPage--;
        }

        pagesString = `&startIndex=${$scope.currentPage}`;
        pagesString += `&maxResults=${$scope.maxResult}`;
        if (!pagingUpdated) {
          $scope.maxResult = page;
        }
      } else if (order !== "" && page === null) {
        $scope.setActive(order);
        orderString = `&orderBy=${order}`;
      }

      console.log(
        dataFilterParsed,
        uri + dataFilterParsed + pagesString + orderString
      );

      $http
        .get(uri + dataFilterParsed + pagesString + orderString)
        .then(function (response) {
          $scope.dataList = response.data.items;
          $scope.totalItems = response.data.totalItems;

          $scope.maxPage = $scope.calculateMaxPage(
            response.data.totalItems,
            $scope.maxResult
          );
        })
        .catch(function (error) {
          console.error("Error fetching data: ", error);
        });
    };

    $scope.expandItem = function (item) {
      item.expanded = !item.expanded;
      if (item.expanded) {
        $http.get(item.selfLink).then(function (response) {
          item.additionalData = response.data;
        });
      }
    };
    $scope.calculateMaxPage = (totalItems, maxResult) => {
      let divider = totalItems / maxResult;
      return Math.round(divider) + 1;
    };
    $scope.toggleVolumesBar = () => {
      $scope.myVolumesBar = !$scope.myVolumesBar; // Toggle the flag when the button is clicked
    };
    $scope.setActive = function (button) {
      $scope.activeButton = button;
    };
    $scope.generateUserId = function () {
      
    };
    $scope.isActive = async function (button) {
      return $scope.activeButton === button;
    };
  },
]);

function capitalizeFirstLetter(inputString = "") {
  if (inputString === "") return "";
  return inputString.charAt(0).toUpperCase() + inputString.slice(1);
}
