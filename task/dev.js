const gulp = require('gulp');
const $ = require('gulp-load-plugins')()//引入的是函数，调用以后返回的是对象
const config = require('../gulpConfig');
const open = require('open');
const proxy = require('http-proxy-middleware');
const runSequence = require('gulp-run-sequence');
const { basePath } = config;


function getProxy(){
  const { proxyList } = config
  const arr = [];
  for(let item in proxyList){
    let pro = proxy(item,proxyList[item]);
    arr.push(pro);
  }
  return arr;
}

//注册合并压缩js的任务
gulp.task('devjs', function () {
  return gulp.src(`${ basePath }/**/*.js`)
    .pipe($.babel()) 
    .on('error',(err)=>{
      console.log(err)
    })
		.pipe($.uglify())
		.pipe(gulp.dest('dist/'))
		.pipe($.livereload())
		.pipe($.connect.reload())
});

//注册编译less的任务
gulp.task('devless', function () {
	return gulp.src(`${ basePath }/**/*.less`)
		.pipe($.less())
		.pipe(gulp.dest('dist/'))
		.pipe($.livereload())
		.pipe($.connect.reload())
});

//注册编译scss的任务
gulp.task('devscss', function () {
	return gulp.src(`${ basePath }/**/*.scss`)
		.pipe($.sass())
		.pipe(gulp.dest('dist/'))
		.pipe($.livereload())
		.pipe($.connect.reload())
});

//注册合并压缩css的任务
gulp.task('devcss',['devless','devscss'] ,function () {
  console.log('监听到css变化')
	return gulp.src(`${ basePath }/**/*.css`)
		.pipe($.cleanCss({compatibility: 'ie8'}))
		.pipe(gulp.dest('dist/'))
		.pipe($.livereload())
		.pipe($.connect.reload())
});

//注册压缩html的任务
gulp.task('devhtml', function () {
	return gulp.src(`${ basePath }/**/*.html`)
		.pipe($.htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest('dist/'))
		.pipe($.livereload())
		.pipe($.connect.reload())
});

gulp.task('devimg', function () {
	return gulp.src([`${ basePath }/**/*.png`,`${ basePath }/**/*.jpeg`,`${ basePath }/**/*.jpg`])
	.pipe(gulp.dest('dist/'))
	.pipe($.connect.reload())
})

// 清理文件
gulp.task('clean', function (cb) {
	return del(['dist/**/*','rev/**/*'], cb);
});

gulp.task('dev',function(done){
	runSequence('clean',['devimg','devjs', 'devless', 'devcss','devhtml'],done)
});

gulp.task('start',['dev'], function () {
	//配置服务器选项
	$.connect.server({
		root : 'dist/',// 监视的源目标文件路径
		livereload : true,// 是否实时刷新
		port : config.port || 8000, // 开启端口号
		middleware: function(connect, opt) {
      return getProxy(config.proxyList);
    }
	});
	open(`http://localhost:${ config.port || 8000 }/`);

	//确认监视的目标并且绑定相应的任务
	gulp.watch(`${ basePath }/**/*.html`, ['devhtml']);
	gulp.watch(`${ basePath }/**/*.js`, ['devjs']);
	gulp.watch([`${ basePath }/**/*.css`, `${ basePath }/**/*.less`], ['devcss']);
})



