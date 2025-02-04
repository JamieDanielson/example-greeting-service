# prints show up in the Tiltfile log so you know what's been run
print("hello my friends")

# Get list of service to run from command line args supported by Tilt
config.define_string_list("to-run", args=True)
cfg = config.parse()

# Resources/groups specified from the command line
# If none are specified it defaults to the "go" group of services so we don't run all the things
to_run = cfg.get('to-run', []) or ["go"]

# required resrouces: collector & redis
# Java & dotnet & python services & node services
docker_compose([
    "./docker-compose.yml",
    "./docker-compose.java.yml",
    "./docker-compose.dotnet.yml",
    "./docker-compose.python.yml",
    "./docker-compose.node.yml"])

# populate redis for message services that use redis
local_resource(
  'load messages into redis',
  cmd='docker-compose exec  -T redis redis-cli -n 0 SADD messages "how are you?" "how are you doing?" "what\'s good?" "what\'s up?" "how do you do?" "sup?" "good day to you" "how are things?" "howzit?" "woohoo"',
  resource_deps=['redis'])

# curl greeting service, language / ecosystem agnostic
local_resource(
  'curl greeting',
  cmd='curl -s -i localhost:7777/greeting',
  trigger_mode=TRIGGER_MODE_MANUAL,
  auto_init=False)

def launch_go_svc(name, dirname="", flags="", auto_init=True):
    '''
    Starts a single go service.

    Parameters:
    name: used to display the name of the process in the tilt tab
    dirname: (optional) directory name in which to run `go run main.go` defaults to 'name'
    flags: (optional) any additional flags to add to the command line
    '''

    cmd = "cd {} && go run main.go -debug {}".format(
        dirname if dirname else name,
        flags if flags else ""
    )
    env = {
        'OTEL_SERVICE_NAME': name,
        'NAME_ENDPOINT': 'http://localhost:8000',
        'YEAR_ENDPOINT': 'http://localhost:6001',
        'MESSAGE_ENDPOINT': 'http://localhost:9000',
    }
    if "go" in to_run or name in to_run:
        print("About to start {} with command {}".format(name, cmd))
    local_resource(name, "", auto_init=auto_init, serve_cmd=cmd, serve_env=env)


def launch_go_frontend(auto_init=True):
    launch_go_svc("frontend-go", dirname="golang/frontend")


def launch_go_message_service(auto_init=True):
    launch_go_svc("message-go", dirname="golang/message-service")


def launch_go_name_service(auto_init=True):
    launch_go_svc("name-go", dirname="golang/name-service")


def launch_go_year_service(auto_init=True):
    launch_go_svc("year-go", dirname="golang/year-service")

def launch_ruby_svc(name, dirname, run_cmd, auto_init=True):
    '''
    Starts a single Ruby service.

    Parameters:
    name: used to display the name of the process in the tilt tab
    dirname: (optional) directory name in which to run `go run main.go` defaults to 'name'
    run_cmd: command required to run the service
    '''

    env = {
        'SERVICE_NAME': name,
        'BUNDLE_BIN': "./.direnv/bin",
        'GEM_HOME': "./.direnv/ruby",
        'OTEL_EXPORTER_OTLP_ENDPOINT': "http://localhost:55681",
    }
    setup_cmd = "cd {} && bundle install".format(dirname)
    serve_cmd = "cd {} && bundle exec {}".format(dirname,run_cmd)

    if "rb" in to_run or name in to_run:
        print("About to start {} with command {}".format(name, serve_cmd))

    local_resource(name, setup_cmd, env=env, auto_init=auto_init, serve_cmd=serve_cmd, serve_env=env)

def launch_ruby_frontend(auto_init=True):
    launch_ruby_svc("frontend-rb", "ruby/frontend", "rackup ./frontend.ru", auto_init=auto_init)

def launch_ruby_message_service(auto_init=True):
    launch_ruby_svc("message-rb", "ruby/message-service", "rackup message.ru --server puma", auto_init=auto_init)

def launch_ruby_name_service(auto_init=True):
    launch_ruby_svc("name-rb", "ruby/name-service", "ruby name.rb", auto_init=auto_init)

def launch_ruby_year_service(auto_init=True):
    launch_ruby_svc("year-rb", "ruby/year-service", "puma --port 6001", auto_init=auto_init)

def launch_elixir_svc(name, dirname="", cmd="", auto_init=True):
    '''
    Starts a single Elixir service.

    Parameters:
    name: used to display the name of the process in the tilt tab
    dirname: (optional) directory name in which to run the app defaults to 'name'
    flags: (optional) any additional flags to add to the command line

    '''

    # env = {'SERVICE_NAME': name}

    setup_cmd = "cd {} && mix local.hex --force && mix local.rebar --force && mix deps.get && mix deps.compile".format(
        dirname if dirname else name,
    )
    serve_cmd = "cd {} && mix {}".format(dirname, cmd)

    if "elixir" in to_run or name in to_run:
        print("About to start {} with command {}".format(name, serve_cmd))

    local_resource(name, setup_cmd, auto_init=auto_init, serve_cmd=serve_cmd)

def launch_elixir_frontend(auto_init=True):
    launch_elixir_svc("frontend-elixir", dirname="elixir/frontend", cmd="phx.server", auto_init=auto_init)

def launch_elixir_message_service(auto_init=True):
    launch_elixir_svc("message-elixir", dirname="elixir/message", cmd="run --no-halt", auto_init=auto_init)

def launch_elixir_name_service(auto_init=True):
    launch_elixir_svc("name-elixir", dirname="elixir/name", cmd="run --no-halt", auto_init=auto_init)

def launch_elixir_year_service(auto_init=True):
    launch_elixir_svc("year-elixir", dirname="elixir/year", cmd="run --no-halt", auto_init=auto_init)

def launch_web_service(name, dirname="", flags="", auto_init=True):
    cmd = "cd {} && npm install && npm start".format(
        dirname if dirname else name,
        flags if flags else ""
    )

    env = {'SERVICE_NAME': name}

    if "web" in to_run or name in to_run:
        print("About to start {} with command {}".format(name, cmd))

    local_resource(name, "", auto_init=auto_init, serve_cmd=cmd, serve_env=env)

def launch_web_vanillajs_service(auto_init=True):
    launch_web_service("vanillajs-web", dirname="web", auto_init=auto_init)

# Launch all services so that all service resources are registered with Tilt

# Java & dotnet & python services use docker

# Server services
launch_go_frontend()
launch_ruby_frontend()
launch_elixir_frontend()

launch_go_message_service()
launch_ruby_message_service()
launch_elixir_message_service()

launch_go_name_service()
launch_ruby_name_service()
launch_elixir_name_service()

launch_go_year_service()
launch_ruby_year_service()
launch_elixir_year_service()

# Client services
launch_web_vanillajs_service()

# Create map of "groups" of services to commonly run together (e.g. all node services)
supported_languages = ["go", "python", "rb", "java", "dotnet", "node", "elixir"]
language_specific_services = ["frontend", "message", "name", "year"]

def append_lang(lang):
    lang_appended_list = []
    for service in language_specific_services:
        lang_appended_list.append(service + "-" +lang)
    return lang_appended_list
groups = { i: append_lang(i) for i in supported_languages }
groups["web"] = ["vanillajs-web"]

# Common resources we always want to run
resources = ['collector', 'redis', 'curl greeting', 'load messages into redis']

# Create the final list of services to run
for arg in to_run:
  if arg in groups:
    resources += groups[arg]
  else:
    # also support specifying individual services instead of groups, e.g. `tilt up a b d`
    resources.append(arg)

# Enable the specified subset of resources or just all the required services + go services if nothing is specified
config.set_enabled_resources(resources)

###
# Notes
###

# syntax for local_resource:
# local_resource ( name , build_cmd , deps=None , trigger_mode=TRIGGER_MODE_AUTO , resource_deps=[] , ignore=[] , auto_init=True , serve_cmd='go run cmd/shepherd/main.go -debug' )
# name
# command to build the thing to run (empty in our world)
# deps are a list of files to watch and, if changed, restart the process
# serve_cmd is the command to run to start the thing, and it's expected that it won't exit
# eg
# local_resource ( "shepherd" , "" , serve_cmd='cd cmd/shepherd && go run main.go -debug -p :8081' )

# link to tilt API docs: https://docs.tilt.dev/api.html
