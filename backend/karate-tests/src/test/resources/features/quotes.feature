@wide
Feature: Quotes API

  Background:
    * def auth = call read('classpath:helpers/auth.feature')
    * def authToken = auth.authToken
    * url baseUrl
    * header Authorization = 'Bearer ' + authToken

  Scenario: List quotes
    Given path 'api', 'quotes'
    And param projectId = projectId
    When method get
    Then status 200

  Scenario: Expired quotes
    Given path 'api', 'quotes', 'expired'
    When method get
    Then status 200
