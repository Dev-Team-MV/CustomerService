@wide
Feature: SMS templates API

  Background:
    * def auth = call read('classpath:helpers/auth.feature')
    * def authToken = auth.authToken
    * url baseUrl
    * header Authorization = 'Bearer ' + authToken

  Scenario: List SMS templates
    Given path 'api', 'sms-templates'
    When method get
    Then status 200
