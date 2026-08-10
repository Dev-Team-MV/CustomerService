@smoke @wide
Feature: Authentication

  Scenario: Admin login and profile
    Given url baseUrl + '/api/auth/login'
    And request { email: '#(adminEmail)', password: '#(adminPassword)' }
    When method post
    Then status 200
    And match response.token == '#string'
    * def authToken = response.token

    Given url baseUrl + '/api/auth/profile'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.email == adminEmail

  Scenario: Admin login endpoint
    Given url baseUrl + '/api/auth/admin/login'
    And request { email: '#(adminEmail)', password: '#(adminPassword)' }
    When method post
    Then status 200
    And match response.token == '#string'
