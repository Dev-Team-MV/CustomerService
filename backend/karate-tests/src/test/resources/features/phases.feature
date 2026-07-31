@wide
Feature: Phases API

  Background:
    * def auth = call read('classpath:helpers/auth.feature')
    * def authToken = auth.authToken
    * url baseUrl
    * header Authorization = 'Bearer ' + authToken

  Scenario: List phases
    Given path 'api', 'phases'
    When method get
    Then status 200
