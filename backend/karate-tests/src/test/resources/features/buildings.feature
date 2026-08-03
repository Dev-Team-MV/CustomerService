@wide
Feature: Buildings API

  Background:
    * def auth = call read('classpath:helpers/auth.feature')
    * def authToken = auth.authToken
    * url baseUrl
    * header Authorization = 'Bearer ' + authToken

  Scenario: List buildings
    Given path 'api', 'buildings'
    And param projectId = projectId
    When method get
    Then status 200
