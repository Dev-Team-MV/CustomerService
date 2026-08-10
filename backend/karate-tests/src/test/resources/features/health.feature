@smoke @wide
Feature: Health check

  Scenario: API health returns OK
    Given url baseUrl + '/api/health'
    When method get
    Then status 200
    And match response.status == 'OK'
