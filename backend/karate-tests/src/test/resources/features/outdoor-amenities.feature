@wide
Feature: Outdoor amenities API

  Background:
    * def auth = call read('classpath:helpers/auth.feature')
    * def authToken = auth.authToken
    * url baseUrl
    * header Authorization = 'Bearer ' + authToken

  Scenario: List outdoor amenities
    Given path 'api', 'outdoor-amenities'
    And param projectId = projectId
    When method get
    Then status 200
