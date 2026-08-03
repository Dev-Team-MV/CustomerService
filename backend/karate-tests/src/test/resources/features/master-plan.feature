@wide
Feature: Master plan API

  Background:
    * def auth = call read('classpath:helpers/auth.feature')
    * def authToken = auth.authToken
    * url baseUrl
    * header Authorization = 'Bearer ' + authToken

  Scenario: Get master plan
    Given path 'api', 'master-plan'
    And param projectId = projectId
    When method get
    Then status 200
