@wide
Feature: Facades API

  Background:
    * def auth = call read('classpath:helpers/auth.feature')
    * def authToken = auth.authToken
    * url baseUrl
    * header Authorization = 'Bearer ' + authToken

  Scenario: List facades
    Given path 'api', 'facades'
    And param projectId = projectId
    When method get
    Then status 200
