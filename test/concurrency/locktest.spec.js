// Copyright 2014 SAP AG.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http: //www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
// either express or implied. See the License for the specific
// language governing permissions and limitations under the License.

'use strict';

const setup = require('../setup');
const client = setup.client;

//this.timeout(15000);

beforeEach(function (done) {
    client.reopen(err => {
        done(err);
    });
});

afterEach(function (done) {
    client.close(() => {
        done();
    });
});

afterAll(function (done) {
    delete setup.client;
    delete setup.rfcClient;
    delete setup.rfcPool;
    done();
});

it('concurrency: invoke() and invoke ()', function (done) {
    let asyncRes = 0;
    client.invoke('/COE/RBP_FE_WAIT', {
            IV_SECONDS: 1
        },
        function (err, res) {
            if (err || ++asyncRes == 2) done(err);
        });
    expect(asyncRes).toEqual(0);
    client.invoke('/COE/RBP_FE_WAIT', {
            IV_SECONDS: 1
        },
        function (err, res) {
            if (err || ++asyncRes == 2) done(err);
        });
    expect(asyncRes).toEqual(0);
});

it('concurrency: invoke() and ping ()', function (done) {
    let asyncRes;
    client.invoke('/COE/RBP_FE_WAIT', {
            IV_SECONDS: 1
        },
        function (err, res) {
            asyncRes = 1;
            done(err);
        });
    expect(asyncRes).toBeUndefined();
    client.ping().then(res => {
        expect(res).toBeTruthy();
    });
});

it('concurrency: ping() and ping ()', function (done) {
    let N = 5;
    let count = 0;
    for (let i = 0; i < N; i++) {
        client.ping().then(res => {
            expect(res).toBeTruthy();
            if (++count === N) done();
        });
    }
});
