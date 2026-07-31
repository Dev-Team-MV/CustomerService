@wide
Feature: Contracts API

  Background:
    * def auth = call read('classpath:helpers/auth.feature')
    * def authToken = auth.authToken
    * url baseUrl
    * header Authorization = 'Bearer ' + authToken

  Scenario: List contracts
    Given path 'api', 'contracts'
    When method get
    Then status 200
