.PHONY: help

help:
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: ## Install Dependencies
	yarn install

test: ## Run Unit Tests
	NODE_ENV=test yarn test

test-watch: ## Run Unit Tests Using Watch Mode
	NODE_ENV=test yarn test:watch

build: ## Make local packages build. Usefull to test build because otherwise the publication automatically launches the build
	yarn clean
	./node_modules/.bin/lerna run prepare

publish: ## Publish on npm
	yarn clean
	./node_modules/.bin/lerna publish

serve-documentation:
	docker run -it --rm \
		-p 4000:4000 \
		-v "${PWD}/docs:/usr/src/app" \
		starefossen/github-pages:onbuild \
		jekyll serve \
			--host=0.0.0.0 \
			--incremental
