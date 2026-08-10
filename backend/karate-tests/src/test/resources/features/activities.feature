@wide
Feature: Activities API

  Background:
    * def auth = call read('classpath:helpers/auth.feature')
    * def authToken = auth.authToken
    * url baseUrl
    * header Authorization = 'Bearer ' + authToken

  Scenario: List activities
    Given path 'api', 'activities'
    And param projectId = projectId
    When method get
    Then status 200

  Scenario: Activity board
    Given path 'api', 'activities', 'board'
    And param projectId = projectId
    When method get
    Then status 200

  Scenario: Activity columns
    Given path 'api', 'activities', 'columns'
    And param projectId = projectId
    When method get
    Then status 200
