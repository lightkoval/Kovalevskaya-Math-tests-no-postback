/**
 * Created by s.kovalevskaya on 02.05.2016.
 */
"use strict";

var controllers = angular.module("tmsControllers", []);

controllers.controller("AuthController", ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {
    $scope.logout = function logout() {
        $rootScope.currentStudent = null;
        $rootScope.currentTest = null;
        $location.path("/");
    };
    $scope.pathe = $location.path();
}]);

controllers.controller("GetSettingsController", ["$scope", "$http", "$rootScope", "$route", function ($scope, $http, $rootScope, $route) {
    $rootScope.activeTab = "settings";
    $scope.$route = $route;
    $scope.getSettings = function getSettings() {
        if (localStorage.settings) {
            $rootScope.settings = angular.fromJson(localStorage.settings);

        } else {
            $http.get("data/setting.json").then(function success(response) {
                $rootScope.settings = response.data;
                localStorage.settings = angular.toJson(response.data);
            });
        }
    };

    $scope.updateSettings = function updateSettings(settings) {
        localStorage.settings = angular.toJson(settings);
    };

    $scope.getSettings();
}]);


controllers.controller("AuthorizeController", ["$scope", "$http", "$location", "$rootScope", "$route", function ($scope, $http, $location, $rootScope, $route) {
    $scope.$route = $route;
    $rootScope.activeTab = "testing";
    if ($rootScope.currentStudent) {
        $location.path("/testing/start_test");
        return;
    }

    $scope.submit = function submit(user) {

        var students = angular.fromJson(localStorage.students);

        if (!students) {
            $rootScope.currentStudent = {id: 1, name: user.name};
            localStorage.students = angular.toJson([$rootScope.currentStudent]);
        } else {
            var userByName;
            students.forEach(function (item) {
                if (item.name == user.name) {
                    userByName = item;
                }
            });

            if (userByName) {
                $rootScope.currentStudent = userByName;
            } else {
                $rootScope.currentStudent = {id: students.length + 1, name: user.name};
                students.push($rootScope.currentStudent);
                localStorage.students = angular.toJson(students);
            }
        }
        $location.path("/testing/start_test");
    };
}]);


controllers.controller("StartTestController", ["$scope", "$http", "$location", "$rootScope", function ($scope, $http, $location, $rootScope) {
    $rootScope.activeTab = "testing";
    if (!localStorage.settings) {
        $http.get("data/setting.json").then(function success(response) {
            $rootScope.settings = response.data;
            localStorage.settings = angular.toJson(response.data);
        });
    } else {
        $rootScope.settings = angular.fromJson(localStorage.settings);
    }

    if (!$rootScope.currentStudent) {
        $location.path("/testing/authorize");
        return;
    }

    $scope.submit = function submit() {
        var tests = angular.fromJson(localStorage.tests) || [];

        $rootScope.testId = null;
        if (tests.length) {
            tests.forEach(function (item) {
                if ((item.studentId == $rootScope.currentStudent.id) && (item.finished == false)) {
                    $rootScope.testId = item.id;
                }
            });
        }
        if (!$rootScope.testId) {
            $rootScope.testId = tests.length + 1;
            tests.push({
                id: $rootScope.testId,
                studentId: $rootScope.currentStudent.id,
                date: new Date(),
                settings: $rootScope.settings,
                finished: false
            });
            localStorage.tests = angular.toJson(tests);
        }
        $location.path("testing/task");
    }
}]);


controllers.controller("TaskController", ["$scope", "$http", "$rootScope", "$location", function ($scope, $http, $rootScope, $location) {
    $rootScope.activeTab = "testing";

    if (!$rootScope.currentStudent || !$rootScope.testId) {
        $location.path("/testing/authorize");
        return;
    }
    refresh();

    function refresh() {
        countAnswers($rootScope.testId);
        if (isAllTasksAnswered($rootScope.testId)) {
            finishTest($rootScope.testId);
        } else {
            getTask($rootScope.testId);
        }
    }

    $scope.sendAnswer = function sendAnswer(answer) {
        var tasks = angular.fromJson(localStorage.tasks);
        tasks.forEach(function (task) {
            if (task.id == $rootScope.taskId) {
                task.studentAnswer = answer;
            }
        });
        localStorage.tasks = angular.toJson(tasks);
        refresh();
    };

    function isAllTasksAnswered(testId) {
        var tests = angular.fromJson(localStorage.tests) || [];
        var tasks = angular.fromJson(localStorage.tasks) || [];

        var currentTest;
        tests.forEach(function (test) {
            if (test.id == testId) {
                currentTest = test;
            }
        });

        var answeredCount = 0;
        if (tasks.length) {
            tasks.forEach(function (task) {
                if (task.testId == testId) {
                    answeredCount++;
                }
            });
        }
        return answeredCount >= +currentTest.settings.numberOfQuestions;
    }

    function countAnswers(testId) {
        var correctAnswersCount = 0, incorrectAnswersCount = 0, totalQuestionsCount = 0;
        var tasks = angular.fromJson(localStorage.tasks) || [];
        if (tasks.length) {
            tasks.forEach(function (task) {
                if (task.testId == testId) {
                    totalQuestionsCount++;
                    if (task.correctAnswer == task.studentAnswer) {
                        correctAnswersCount++;
                    } else if (task.studentAnswer) {
                        incorrectAnswersCount++;
                    }
                }
            });
        }
        $scope.correctAnswersCount = correctAnswersCount;
        $scope.incorrectAnswersCount = incorrectAnswersCount;
    }

    function getTask(testId) {
        var notCompletedTask;
        var tasks = angular.fromJson(localStorage.tasks) || [];
        tasks.forEach(function (task) {
            if (task.testId == testId && !task.studentAnswer) {
                notCompletedTask = task;
            }
        });

        if (notCompletedTask) {
            $scope.question = notCompletedTask.question;
        } else {
            var operations = addOperation($rootScope.settings);
            var task = chooseOperation(operations);

            $scope.question = task.question;
            $rootScope.taskId = tasks.length + 1;

            tasks.push({
                id: $rootScope.taskId,
                testId: $rootScope.testId,
                question: task.question,
                correctAnswer: task.result
            });
            localStorage.tasks = angular.toJson(tasks);
        }
        $scope.answer = "";
    }

    function finishTest(testId) {
        var tests = angular.fromJson(localStorage.tests);
        tests.forEach(function (item) {
            if (item.id == testId) {
                item.finished = true;
                item.correctAnswersCount = $scope.correctAnswersCount;
                item.incorrectAnswersCount = $scope.incorrectAnswersCount;
            }
        });
        localStorage.tests = angular.toJson(tests);
        $location.path("/");
    }
}]);


controllers.controller("ReportsController", ["$scope", "$rootScope", "$location", function ($scope, $rootScope, $location) {
    $rootScope.from = {
        value: new Date(2016, 4, 1)
    };
    $rootScope.until = {
        value: new Date()
    };
}]);

controllers.controller("TestedStudentsController", ["$scope", "$rootScope", "$location", function ($scope, $rootScope, $location) {

    var students = angular.fromJson(localStorage.students);
    var tests = angular.fromJson(localStorage.tests);
    var report = [];

    tests.forEach(function (item) {
        if (new Date(item.date) >= $rootScope.from.value && new Date(item.date) <= $rootScope.until.value) {

            students.forEach(function (student) {
                if (student.id == item.studentId) {
                    item.name = student.name;
                }
            });
            report.push(item);

        }
    });


    $scope.students = report;


}]);

controllers.controller("NotTestedStudentsController", ["$scope", "$rootScope", "$location", function ($scope, $rootScope, $location) {
    var students = angular.fromJson(localStorage.students);
    var tests = angular.fromJson(localStorage.tests);
    var temp = [];
    var report = [];


    tests.forEach(function (item) {
        if (new Date(item.date) >= $rootScope.from.value && new Date(item.date) <= $rootScope.until.value) {
            temp.push(item.studentId);
        }
    });

    students.forEach(function (student) {
        var a = false;
        temp.forEach(function (item) {

            if (item == student.id) {
                a = true;
            }
        });
        if (!a) {
            report.push(student);
        }
    });


    $scope.students = report;

}]);

controllers.controller("PoorStudentsController", ["$scope", "$http", "$location", function ($scope, $http, $location) {
    $http.get("/api/reports/poor_students").then(function success(response) {
        $scope.students = response.data.table;

    })
}]);