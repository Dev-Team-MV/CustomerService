@wide
Feature: Reports API

  Background:
    * def auth = call read('classpath:helpers/auth.feature')
    * def authToken = auth.authToken
    * url baseUrl
    * header Authorization = 'Bearer ' + authToken

  Scenario: Upload tracker
    Given path 'api', 'reports', 'upload-tracker'
    And param startDate = '2020-01-01'
    And param endDate = '2030-12-31'
    And param projectId = projectId
    When method get
    Then status 200
