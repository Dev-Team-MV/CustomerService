@smoke @wide
Feature: Users API

  Background:
    * def auth = call read('classpath:helpers/auth.feature')
    * def authToken = auth.authToken
    * url baseUrl
    * header Authorization = 'Bearer ' + authToken

  Scenario: List users for project
    Given path 'api', 'users'
    And param projectId = projectId
    When method get
    Then status 200

  Scenario: Search users
    Given path 'api', 'users', 'search'
    And param projectId = projectId
    And param q = 'Acceptance'
    When method get
    Then status 200

  Scenario: My projects
    Given path 'api', 'users', 'me', 'projects'
    When method get
    Then status 200
