module.exports = (grunt) ->
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-watch'

  grunt.initConfig
    coffee:
      routes:
        options:
          bare: true
        files: [
          expand: true
          cwd: './'
          src: ['**/*.coffee']
          dest: './'
          ext: '.js'
        ]
    watch:
      coffee:
        files: ['**/*.coffee']
        tasks: ['coffee']

  grunt.registerTask 'dev', 'Set up the Parse dev environment', ->
    grunt.task.run ['coffee', 'watch']

  return
  