@wide
Feature: Notifications API

  Background:
    * def auth = call read('classpath:helpers/auth.feature')
    * def authToken = auth.authToken
    * url baseUrl
    * header Authorization = 'Bearer ' + authToken

  Scenario: Latest notifications
    Given path 'api', 'notifications', 'latest'
    When method get
    Then status 200

  Scenario: Notifications websocket docs
    Given path 'api', 'notifications', 'ws', 'notifications'
    When method get
    Then status 200
