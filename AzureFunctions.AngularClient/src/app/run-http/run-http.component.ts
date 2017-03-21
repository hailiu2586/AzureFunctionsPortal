import {Component, Input, Inject, ElementRef, Output, EventEmitter, ViewChildren, QueryList} from '@angular/core';
import {HttpRunModel, Param} from '../shared/models/http-run';
import {BindingType} from '../shared/models/binding'
import {FunctionInfo} from '../shared/models/function-info';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {Constants} from '../shared/models/constants';


@Component({
  selector: 'run-http',
  templateUrl: './run-http.component.html',
  styleUrls: ['./run-http.component.scss', '../function-dev/function-dev.component.scss'],
  inputs: ['functionInfo', 'functionInvokeUrl']
})
export class RunHttpComponent {
    @Output() validChange = new EventEmitter<boolean>();
    model: HttpRunModel = new HttpRunModel();
    valid: boolean;
    availableMethods: string[] = [];


    constructor(private _translateService: TranslateService) {
    }

    set functionInfo(value: FunctionInfo) {
        if (value.test_data) {
            try {
                this.model = JSON.parse(value.test_data);
                if (this.model.body === undefined) {
                    this.model = undefined;
                }
            } catch (e) {
                this.model = undefined;
            }
        }

        var httpTrigger = value.config.bindings.find(b => {
            return b.type === BindingType.httpTrigger.toString();
        });

        this.availableMethods = [];
        if (httpTrigger.methods) {
            httpTrigger.methods.forEach((m) => {
                this.availableMethods.push(m);
            });
        } else {
            this.availableMethods = [
                Constants.httpMethods.POST,
                Constants.httpMethods.GET,
                Constants.httpMethods.DELETE,
                Constants.httpMethods.HEAD,
                Constants.httpMethods.PATCH,
                Constants.httpMethods.PUT,
                Constants.httpMethods.OPTIONS,
                Constants.httpMethods.TRACE
            ];
        }

        if (this.model === undefined) {
            this.model = new HttpRunModel();
            this.model.method = Constants.httpMethods.POST;
            this.model.body = value.test_data;
        }
        if (!this.model.method && this.availableMethods.length > 0) {
            this.model.method = this.availableMethods[0];
        }
    }

    set functionInvokeUrl(value: string) {
        if (value) {
            var params = this.getQueryParams(value);
            var pathParams = this.getPathParams(value);
            params = pathParams.concat(params);
            params.forEach((p) => {
                var findResult = this.model.queryStringParams.find((qp) => {
                    return qp.name === p.name;
                });
                if (!findResult) {
                    this.model.queryStringParams.push(p);
                }
            });
            this.change();
        }
    }

    removeQueryStringParam(index: number) {
        this.model.queryStringParams.splice(index, 1);
        this.change();
    }

    removeHeader(index: number) {
        this.model.headers.splice(index, 1);
        this.change();
    }

    addQueryStringParam() {
        this.model.queryStringParams.push(
            {
                name: "",
                value: "",
            });
        this.change();
    }

    addHeader() {
        this.model.headers.push(
            {
                name: "",
                value: "",
            });
        this.change();
    }

    change(event?: any) {
        var emptyQuery = this.model.queryStringParams.find((p) => {
            return !p.name;
        });

        var emptyHeader = this.model.headers.find((h) => {
            return !h.name;
        });

        this.valid = !(emptyQuery || emptyHeader);
        this.validChange.emit(this.valid);
    }

    private getQueryParams(url: string): Param[] {
        var result = [];
        var urlCopy = url;


        // Remove path params
        var regExp = /\{([^}]+)\}/g;
        var matches = urlCopy.match(regExp);
        if (matches) {
            matches.forEach((m) => {
                urlCopy = urlCopy.replace(m, "");
            });
        }

        var queryArray = urlCopy.split('?');

        if (queryArray.length > 1) {
            var query = queryArray[1];
            var vars = query.split('&');
            if (vars.length === 1) {
                vars[0] = query;
            }

            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split('=');
                result.push({
                    name: decodeURIComponent(pair[0]),
                    value: decodeURIComponent(pair[1]),
                    isFixed: true
                });
            }
        }
        return result;
    }

    private getPathParams(url: string): Param[] {
        var regExp = /\{([^}]+)\}/g;

        var matches = url.match(regExp);
        var result = [];

        if (matches) {
            matches.forEach((m) => {
                var splitResult = m.split(":");
                result.push({
                    name: splitResult[0].replace("{", "").replace("}", ""),
                    value: "",
                    isFixed: false
                });
            });
        }

        return result;
    }
}