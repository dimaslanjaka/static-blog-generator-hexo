# github pages validator

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
```

## demo

- https://github.com/dimaslanjaka/dimaslanjaka.github.io/actions