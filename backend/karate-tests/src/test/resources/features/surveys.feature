@wide
Feature: Surveys API

  Background:
    * def auth = call read('classpath:helpers/auth.feature')
    * def authToken = auth.authToken
    * url baseUrl
    * header Authorization = 'Bearer ' + authToken

  Scenario: List surveys
    Given path 'api', 'surveys'
    And param projectId = projectId
    When method get
    Then status 200

  Scenario: Survey templates
    Given path 'api', 'surveys', 'templates'
    When method get
    Then status 200

  Scenario: Survey stats
    Given path 'api', 'surveys', 'stats', projectId
    When method get
    Then status 200
