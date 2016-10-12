module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        dir: {
            output: 'build',
            src: 'src'
        },
        browserify: {
            build: {
                src: ['<%= dir.src %>/js/main.js'],
                dest: '<%= dir.output %>/js/app.bundle.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! Grunt Uglify <%= grunt.template.today("yyyy-mm-dd") %> */ '
            },
            build: {
                src: '<%= dir.output %>/js/app.bundle.js',
                dest: '<%= dir.output %>/js/app.bundle.min.js'
            }
        },
        copy: {
            scripts: {
                src: [
                    'node_modules/createjs-combined/createjs-2015.11.26.min.js'
                ],
                dest: '<%= dir.output %>/js/',
                expand: true,
                flatten: true
            },
            html: {
                src: [
                    '<%= dir.src %>/index.html',
                    '<%= dir.src %>/levelgen.html',
                    '<%= dir.src %>/favicon.ico'
                ],
                dest: '<%= dir.output %>/',
                expand: true,
                flatten: true
            },
            level: {
                src: [
                    'level/**/*'
                ],
                dest: '<%= dir.output %>/',
                expand: true,
                flatten: false
            }
        },
        connect: {
            server: {
                options: {
                    port: 9080,
                    base: '<%= dir.output %>'
                }
            }
        },
        run: {
            options: {
                // Task-specific options go here. 
            },
            levelgenerator: {
                cmd: 'node',
                args: [
                    'levelgen.js'
                ]
            }
        },
        watch: {
            scripts: {
                files: ['<%= dir.src %>/js/**/*.js'],
                tasks: ['browserify', 'uglify'],
                livereload: true
            },
            html: {
                files: ['<%= dir.src %>/**/*.html'],
                tasks: ['copy:html'],
                livereload: true
            },
            level: {
                files: ['level/**/*'],
                tasks: ['run:levelgenerator', 'copy:level'],
                livereload: true
            }
        }
    });

    grunt.loadNpmTasks('grunt-run');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');

    grunt.registerTask('build', ['browserify', 'uglify', 'copy:scripts', 'copy:html']);
    grunt.registerTask('default', ['build', 'connect', 'run', 'copy:level', 'watch']);
};