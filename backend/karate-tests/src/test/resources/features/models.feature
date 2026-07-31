@wide
Feature: Models API

  Background:
    * def auth = call read('classpath:helpers/auth.feature')
    * def authToken = auth.authToken
    * url baseUrl
    * header Authorization = 'Bearer ' + authToken

  Scenario: List models
    Given path 'api', 'models'
    And param projectId = projectId
    When method get
    Then status 200
