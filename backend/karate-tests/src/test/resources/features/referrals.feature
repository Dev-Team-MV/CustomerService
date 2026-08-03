@wide
Feature: Referrals API

  Background:
    * def auth = call read('classpath:helpers/auth.feature')
    * def authToken = auth.authToken
    * url baseUrl
    * header Authorization = 'Bearer ' + authToken

  Scenario: List referrals
    Given path 'api', 'referrals'
    And param projectId = projectId
    When method get
    Then status 200

  Scenario: Referral programs
    Given path 'api', 'referrals', 'programs'
    When method get
    Then status 200

  Scenario: Referral stats
    Given path 'api', 'referrals', 'stats', projectId
    When method get
    Then status 200
