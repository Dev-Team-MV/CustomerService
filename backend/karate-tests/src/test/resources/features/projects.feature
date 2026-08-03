@smoke @wide
Feature: Projects API

  Background:
    * def auth = call read('classpath:helpers/auth.feature')
    * def authToken = auth.authToken
    * url baseUrl
    * header Authorization = 'Bearer ' + authToken

  Scenario: Ping projects router
    Given path 'api', 'projects', 'ping'
    When method get
    Then status 200

  Scenario: List projects
    Given path 'api', 'projects'
    When method get
    Then status 200

  Scenario: Get project by id
    Given path 'api', 'projects', projectId
    When method get
    Then status 200

  Scenario: Outdoor amenity keys
    Given path 'api', 'projects', 'outdoor-amenity-keys'
    When method get
    Then status 200

  Scenario: Project catalog config
    Given path 'api', 'projects', projectId, 'catalog-config'
    When method get
    Then status 200

  Scenario: Project variables
    Given path 'api', 'projects', projectId, 'variables'
    When method get
    Then status 200

  Scenario: Project outdoor amenities
    Given path 'api', 'projects', projectId, 'outdoor-amenities'
    When method get
    Then status 200

  Scenario: Project community spaces
    Given path 'api', 'projects', projectId, 'community-spaces'
    When method get
    Then status 200
