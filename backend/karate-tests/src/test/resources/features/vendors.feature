@wide
Feature: Vendors API

  Background:
    * def auth = call read('classpath:helpers/auth.feature')
    * def authToken = auth.authToken
    * url baseUrl
    * header Authorization = 'Bearer ' + authToken

  Scenario: List vendors
    Given path 'api', 'vendors'
    And param projectId = projectId
    When method get
    Then status 200

  Scenario: Vendor categories
    Given path 'api', 'vendors', 'categories'
    When method get
    Then status 200
