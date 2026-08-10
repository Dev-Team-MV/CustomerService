@wide @external
Feature: Backup API

  Scenario: Backup run requires auth
    Given url baseUrl
    And path 'api', 'backup', 'run'
    When method post
    Then status 401
