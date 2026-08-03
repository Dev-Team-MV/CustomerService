@wide
Feature: Under construction API

  Background:
    * def auth = call read('classpath:helpers/auth.feature')
    * def authToken = auth.authToken
    * url baseUrl
    * header Authorization = 'Bearer ' + authToken

  Scenario: List under construction
    Given path 'api', 'under-construction'
    And param projectId = projectId
    When method get
    Then status 200
