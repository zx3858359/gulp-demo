var gulp = require('gulp');
var $ = require('gulp-load-plugins')()//引入的是函数，调用以后返回的是对象
var del = require('del');
const config = require('../gulpConfig');

const { basePath } = config;
var runSequence = require('gulp-run-sequence');

//注册合并压缩js的任务
gulp.task('js', function () {
  return gulp.src(`${ basePath }/**/*.js`)
    .pipe($.babel()) 
    .on('error',(err)=>{
      console.log(err)
    })
		.pipe($.uglify())
		.pipe($.rev())
		.pipe(gulp.dest('dist/'))
		.pipe($.rev.manifest())
		.pipe(gulp.dest('rev/js'))
});

//注册编译less的任务
gulp.task('less', function () {
	return gulp.src(`${ basePath }/**/*.less`)
		.pipe($.less())
		.pipe(gulp.dest('dist/'))
});

//注册编译less的任务
gulp.task('scss', function () {
	return gulp.src(`${ basePath }/**/*.scss`)
		.pipe($.sass())
		.pipe(gulp.dest('dist/'))
});

//注册合并压缩css的任务
gulp.task('css',['less','scss'] ,function () {
	return gulp.src(`${ basePath }/**/*.css`)
		.pipe($.cleanCss({compatibility: 'ie8'}))
		.pipe($.rev())
		.pipe(gulp.dest('dist/'))
		.pipe($.rev.manifest())
		.pipe(gulp.dest('rev/css' ))
});

//注册压缩html的任务
gulp.task('html', function () {
	return gulp.src(`${ basePath }/**/*.html`)
		.pipe($.htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest('dist/'))
});

// 图片处理
gulp.task('img', function () {
	return gulp.src([`${ basePath }/**/*.png`,`${ basePath }/**/*.jpeg`,`${ basePath }/**/*.jpg`,`${ basePath }/**/*.svg`])
	.pipe($.imagemin({
		optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
		progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
		interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
		multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
	}))
	.pipe(gulp.dest('dist/'))
});

// 清理文件
gulp.task('clean', function (cb) {
	return del(['dist/**/*','rev/**/*'], cb);
});

// 改变html中script和link 的链接
gulp.task('rev',['css','js'], function() {
	var options = {
      removeComments: true,//清除HTML注释
      collapseWhitespace: true,//压缩HTML
      collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
      removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
      removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
      removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
      minifyJS: true,//压缩页面JS
      minifyCSS: true//压缩页面CSS
    };
    return gulp.src(['rev/**/*.json', `${ basePath }/**/*.html`])
		.pipe($.revCollector(options))
		.pipe($.htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist'));
});

//注册一个build任务
gulp.task('build',function(done){
	runSequence('clean',['img','js', 'less', 'css','rev'],done)
});
