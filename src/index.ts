import { createElement, render, Fragment } from "./Factory/Factory";
import {useState} from "./hooks/useState";
import {useEffect} from "./hooks/useEffect";
import { useRef } from "./hooks/useRef";
import useRender from "./hooks/useRender";
import { workLoop } from "./render/render";
const Miku = {
    createElement,
    render,
    Fragment,
    useState,
    useRender,
    useEffect,
    useRef,
    workLoop
}
export {createElement, render, Fragment, useState, useEffect, useRef, useRender, workLoop};
export default Miku;