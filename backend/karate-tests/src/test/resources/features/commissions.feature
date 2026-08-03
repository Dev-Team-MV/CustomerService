@wide
Feature: Commissions API

  Background:
    * def auth = call read('classpath:helpers/auth.feature')
    * def authToken = auth.authToken
    * url baseUrl
    * header Authorization = 'Bearer ' + authToken

  Scenario: List commissions
    Given path 'api', 'commissions'
    And param projectId = projectId
    When method get
    Then status 200
