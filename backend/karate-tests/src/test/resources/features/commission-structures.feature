@wide
Feature: Commission structures API

  Background:
    * def auth = call read('classpath:helpers/auth.feature')
    * def authToken = auth.authToken
    * url baseUrl
    * header Authorization = 'Bearer ' + authToken

  Scenario: List commission structures
    Given path 'api', 'commission-structures'
    And param projectId = projectId
    When method get
    Then status 200
