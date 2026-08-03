@wide
Feature: Clubhouse API

  Background:
    * def auth = call read('classpath:helpers/auth.feature')
    * def authToken = auth.authToken
    * url baseUrl
    * header Authorization = 'Bearer ' + authToken

  Scenario: Clubhouse public
    Given path 'api', 'clubhouse', 'public'
    And param projectId = projectId
    When method get
    Then status 200

  Scenario: Clubhouse authenticated
    Given path 'api', 'clubhouse'
    And param projectId = projectId
    When method get
    Then status 200

  Scenario: Clubhouse timeline
    Given path 'api', 'clubhouse', 'timeline'
    And param projectId = projectId
    When method get
    Then status 200
