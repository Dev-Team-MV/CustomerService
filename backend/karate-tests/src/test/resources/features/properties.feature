@smoke @wide
Feature: Properties API

  Background:
    * def auth = call read('classpath:helpers/auth.feature')
    * def authToken = auth.authToken
    * url baseUrl
    * header Authorization = 'Bearer ' + authToken

  Scenario: List properties by projectId
    Given path 'api', 'properties'
    And param projectId = projectId
    When method get
    Then status 200

  Scenario: Property stats
    Given path 'api', 'properties', 'stats'
    And param projectId = projectId
    When method get
    Then status 200
