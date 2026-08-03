@wide
Feature: News API

  Background:
    * def auth = call read('classpath:helpers/auth.feature')
    * def authToken = auth.authToken
    * url baseUrl
    * header Authorization = 'Bearer ' + authToken

  Scenario: List news
    Given path 'api', 'news'
    When method get
    Then status 200

  Scenario: Published news
    Given path 'api', 'news', 'published'
    When method get
    Then status 200
