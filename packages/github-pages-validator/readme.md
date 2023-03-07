# github pages validator
Github Pages Validator. Ensure all necessary conditions are met before publishing the github page using github actions.

## usages

| parameter | description |
| :--- | :--- |
| -f, --file | file path |
| -a, --alias | alias name |
| -s, --scope | scope checks |

```bash
# check filePath with all scopes
gpv -f test/empty-body.html
# check filePath with alias homepage scopes empty file and empty body html
gpv -f test/empty-body.html -a homepage -s empty,body
# verbose
gpv -f test/empty-body.html -s body,verbose
```

## demo

- https://github.com/dimaslanjaka/dimaslanjaka.github.io/actions