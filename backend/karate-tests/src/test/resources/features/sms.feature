@wide @external
Feature: SMS send API

  Scenario: SMS send requires auth
    Given url baseUrl
    And path 'api', 'sms', 'send'
    And request { to: '+10000000000', body: 'test' }
    When method post
    Then status 401
