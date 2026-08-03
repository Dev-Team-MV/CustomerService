@wide @external
Feature: Upload / GCS API

  Background:
    * def auth = call read('classpath:helpers/auth.feature')
    * def authToken = auth.authToken
    * url baseUrl
    * header Authorization = 'Bearer ' + authToken

  Scenario: Test GCS connection
    Given path 'api', 'upload', 'test-connection'
    When method get
    Then status 200
