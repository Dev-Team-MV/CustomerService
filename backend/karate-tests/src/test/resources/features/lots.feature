@wide
Feature: Lots API

  Background:
    * def auth = call read('classpath:helpers/auth.feature')
    * def authToken = auth.authToken
    * url baseUrl
    * header Authorization = 'Bearer ' + authToken

  Scenario: List lots
    Given path 'api', 'lots'
    And param projectId = projectId
    When method get
    Then status 200

  Scenario: Lot stats
    Given path 'api', 'lots', 'stats'
    And param projectId = projectId
    When method get
    Then status 200
