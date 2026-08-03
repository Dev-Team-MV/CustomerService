@wide
Feature: Parking spots API

  Background:
    * def auth = call read('classpath:helpers/auth.feature')
    * def authToken = auth.authToken
    * url baseUrl
    * header Authorization = 'Bearer ' + authToken

  Scenario: List parking spots
    Given path 'api', 'parking-spots'
    And param projectId = projectId
    When method get
    Then status 200
