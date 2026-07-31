@wide
Feature: Onboarding API

  Background:
    * def auth = call read('classpath:helpers/auth.feature')
    * def authToken = auth.authToken
    * url baseUrl
    * header Authorization = 'Bearer ' + authToken

  Scenario: List onboarding checklists
    Given path 'api', 'onboarding'
    And param projectId = projectId
    When method get
    Then status 200
