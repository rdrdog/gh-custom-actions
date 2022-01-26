import { config } from '../config';
import { expect } from 'chai';
import fetch from "node-fetch";
import { Given, Then, When } from "@cucumber/cucumber";
import { CommonWorld } from "../world/world.common";

Given('I am an API client', function (this: CommonWorld) {

});

When('I call {string} {string}', async function (this: CommonWorld, verb: string, path: string) {
  const url = config.apiBaseUrl + path;

  await this.callApiAsync(
    async () => await fetch(url, {
      method: verb,
      headers: this.getDefaultHeaders()
    })
  );
});

Then('I should get back a status code of {int}', async function (this: CommonWorld, statusCode: number) {
  expect(this.getStatusCode()).to.equal(statusCode);
});


Then("the response should contain {string}", function (this: CommonWorld, contents: string) {
  expect(this.getResponseBody()).to.contain(contents);
});
