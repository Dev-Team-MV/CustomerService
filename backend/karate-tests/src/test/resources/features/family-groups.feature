@wide
Feature: Family groups API

  Background:
    * def auth = call read('classpath:helpers/auth.feature')
    * def authToken = auth.authToken
    * url baseUrl
    * header Authorization = 'Bearer ' + authToken

  Scenario: My family groups
    Given path 'api', 'family-groups'
    When method get
    Then status 200
