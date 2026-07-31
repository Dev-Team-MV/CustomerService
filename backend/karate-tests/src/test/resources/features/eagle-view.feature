@wide
Feature: Eagle view API

  Background:
    * def auth = call read('classpath:helpers/auth.feature')
    * def authToken = auth.authToken
    * url baseUrl
    * header Authorization = 'Bearer ' + authToken

  Scenario: List eagle views
    Given path 'api', 'eagle-view'
    And param projectId = projectId
    When method get
    Then status 200
