@smoke
Feature: Example hello-world

Scenario: I want to say hello

  Given I am an API client
  When I call 'GET' '/'
  Then I should get back a status code of 200
  And the response should contain 'Hello World!'


  Given I am an API client
  When I call 'GET' '/a-path?abc=123'
  Then I should get back a status code of 200
  And the response should contain 'Hello from a path!'
  And the response should contain '"abc":"123"'
