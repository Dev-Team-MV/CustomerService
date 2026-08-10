@ignore
Feature: Shared auth helper

  Scenario: Login and expose token
    Given url baseUrl + '/api/auth/login'
    And request { email: '#(adminEmail)', password: '#(adminPassword)' }
    When method post
    Then status 200
    And match response.token == '#string'
    * def authToken = response.token
