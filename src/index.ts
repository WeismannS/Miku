import { createElement, render, Fragment } from "./Factory/Factory.ts";
import {useState} from "./hooks/useState.ts";
import {useEffect} from "./hooks/useEffect.ts";
import { useRef } from "./hooks/useRef.ts";
import useRender from "./hooks/useRender.ts";
const Miku = {
    createElement,
    render,
    Fragment,
    useState,
    useRender,
    useEffect,
    useRef
}
export {createElement, render, Fragment, useState, useEffect, useRef, useRender};
export default Miku;