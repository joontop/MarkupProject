# CLAYON

Clayon Mark-up project

## 스펙
````
node 10.15.3
npm 6.4.1
gulp 4.0.2
````

- MAC 환경이라면 nvm use 로 node version 변경 가능
- 10.15.3 이 깔려있지 않다면 nvm install 10.15.3


## 인스톨
```` 
$ npm install
```` 

## 데브서버 띄우고 watch 하기

```sh 
$ npm run dev
``` 
- http://localhost:8080 로 접속가능

## 스프라이트 아이콘 사이즈가 홀수인경우 짝수로 변환
```sh 
$ npm run resize
``` 
- 빌드하기전에 한번 돌려주는걸로

## 빌드하기
```` 
$ npm run build
```` 
- dist 폴더를 압축하여 client 에게 전달

## 이미지 폴더 구조변경

- src/img/default (전경으로 사용할 단독이미지)
- src/img/sprite (자동으로 생성되는 폴더)